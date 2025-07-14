package builder

import (
	"database/sql"
	"fmt"
	"io/fs"
	"path/filepath"
	"strings"

	"github.com/07prajwal2000/servet/lib"
	"github.com/07prajwal2000/servet/loaders"
	"github.com/07prajwal2000/servet/types"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/redis/go-redis/v9"
	"golang.org/x/sync/errgroup"
)

type Builder struct {
	ClickhouseConn driver.Conn
	PostgresConn   *sql.DB
	RedisConn      *redis.Client
	BuildDetails   *types.BuildDetails
	Logger         *lib.ClickhouseLogger
	S3             *lib.S3
	Notifier       *lib.RedisNotify
}

func NewBuilder(clickhouseConn driver.Conn, postgresConn *sql.DB, redisConn *redis.Client, buildDetails *types.BuildDetails, s3 *lib.S3) *Builder {
	notifier := lib.NewRedisNotifier(buildDetails.Id, redisConn)
	logger := lib.NewClickhouseLogger(clickhouseConn, buildDetails, notifier)
	return &Builder{
		ClickhouseConn: clickhouseConn,
		PostgresConn:   postgresConn,
		RedisConn:      redisConn,
		BuildDetails:   buildDetails,
		Logger:         logger,
		S3:             s3,
		Notifier:       notifier,
	}
}

func (b *Builder) Build() error {
	gitLoader := loaders.NewGitLoader(b.BuildDetails, b.Logger)
	b.Notifier.NotifyBuildStarted()
	err := gitLoader.Load()
	if err != nil {
		b.Logger.LogError("GIT REPO ERROR: " + err.Error())
		return err
	}
	nodeBuilder := NewNodeBuilder(b)
	err = nodeBuilder.InstallPackages()
	if err != nil {
		b.Logger.LogError("INSTALL PKG ERROR: " + err.Error())
		b.Notifier.NotifyBuildError()
		return err
	}
	err = nodeBuilder.BuildProject()
	if err != nil {
		b.Logger.LogError("BUILD ERROR: " + err.Error())
		b.Notifier.NotifyBuildError()
		return err
	}
	err = b.uploadArtifacts()
	if err != nil {
		b.Logger.LogError("UPLOADING FILES TO S3 HAS FAILED")
		return err
	}
	b.Notifier.NotifyBuildSuccess()
	return nil
}

func (b *Builder) uploadArtifacts() error {
	filesList := b.GetFilesList()
	errGrp := new(errgroup.Group)
	errGrp.SetLimit(10)
	for _, file := range filesList {
		file = strings.ReplaceAll(file, "\\", "/")
		errGrp.Go(func() error {
			return b.S3.UploadFile(fmt.Sprintf("%s/%s", b.BuildDetails.ApplicationSubDomain, file), file)
		})
	}
	err := errGrp.Wait()
	if err != nil {
		return err
	}
	b.Logger.LogInfo("FILES UPLOADED TO CDN")
	return err
}

func (b *Builder) GetFilesList() []string {
	filesList := []string{}
	err := filepath.Walk("./", func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		filesList = append(filesList, path)
		return nil
	})
	if err != nil {
		return []string{}
	}
	return filesList
}

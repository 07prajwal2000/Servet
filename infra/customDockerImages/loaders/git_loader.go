package loaders

import (
	"crypto/rand"
	"os"

	"github.com/07prajwal2000/servet/lib"
	"github.com/07prajwal2000/servet/types"
)

type GitLoader struct {
	logger *lib.ClickhouseLogger
	Url    string
}

func NewGitLoader(details *types.BuildDetails, logger *lib.ClickhouseLogger) *GitLoader {
	return &GitLoader{
		logger,
		details.Url,
	}
}

func (loader *GitLoader) Load() error {
	err := loader.createDirectory()
	if err != nil {
		return err
	}
	executor := lib.NewCliExecutor("git", "clone", loader.Url, ".")
	go executor.Run()
	for event := range executor.Channel {
		if event.Done {
			break
		}
		if event.Error != nil {
			return event.Error
		}
		// pushing to log store
		if event.Level == lib.LEVEL_INFO {
			loader.logger.LogInfo(event.Log)
		} else {
			loader.logger.LogInfo(event.Log)
		}
	}
	return err
}

func (loader *GitLoader) createDirectory() error {
	dirName := rand.Text()[:10]
	err := os.MkdirAll(dirName, 0755)
	if err != nil {
		return err
	}
	err = os.Chdir(dirName)
	return err
}

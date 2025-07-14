package main

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strconv"

	"database/sql"

	"github.com/07prajwal2000/servet/builder"
	"github.com/07prajwal2000/servet/lib"
	"github.com/07prajwal2000/servet/types"
	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
)

func main() {
	args := os.Args[1:]
	argValues := parseArgs(args)
	if argValues == nil {
		log.Fatal("Failed to parse arg values")
	}
	postgresConn := connectPostgres(argValues.Secrets.PostgresConnection)
	if postgresConn == nil {
		log.Fatal("Failed to connect to postgres")
	}
	clickhouseConn := connectClickhouse(&argValues.Secrets)
	if clickhouseConn == nil {
		log.Fatal("Failed to connect to clickhouse")
	}
	redisConn := connectRedis(argValues.Secrets.RedisConnection)
	if redisConn == nil {
		log.Fatal("Failed to connect to redis")
	}
	s3 := lib.NewS3(argValues.Secrets.S3Endpoint, argValues.Secrets.S3Key, argValues.Secrets.S3Secret, "public-web-apps")
	builder := builder.NewBuilder(clickhouseConn, postgresConn, redisConn, &argValues.BuildDetails, s3)
	if err := builder.Build(); err != nil {
		log.Fatal("Failed to build")
	}
}

func connectRedis(connStr string) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr: connStr,
	})
	if err := rdb.Ping(context.Background()).Err(); err != nil {
		return nil
	}
	fmt.Println("Redis connected")
	return rdb
}

func connectClickhouse(secrets *types.Secrets) driver.Conn {
	connStr := fmt.Sprintf("%s:%d", secrets.ClickhouseHost, secrets.ClickhousePort)
	ch, err := clickhouse.Open(&clickhouse.Options{
		Protocol: clickhouse.HTTP,
		Addr:     []string{connStr},
		Auth: clickhouse.Auth{
			Database: secrets.ClickhouseDatabase,
			Username: secrets.ClickhouseUser,
			Password: secrets.ClickhousePassword,
		},
	})
	if err != nil {
		fmt.Println(err)
		return nil
	}
	if err = ch.Ping(context.Background()); err != nil {
		fmt.Println(err)
		return nil
	}
	fmt.Println("Clickhouse connected")
	return ch
}

func connectPostgres(connStr string) *sql.DB {
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		fmt.Println(err)
		return nil
	}
	if err = db.Ping(); err != nil {
		fmt.Println(err)
		return nil
	}
	fmt.Println("Postgres connected")
	return db
}

func parseArgs(args []string) *types.ArgValues {
	if len(args) < 3 {
		fmt.Println("Not enough arguments")
		return nil
	}
	maxDuration, err := strconv.Atoi(args[0])
	if err != nil {
		fmt.Println("Failed to parse logs", err)
		return nil
	}
	var buildDetails types.BuildDetails
	base64DecodedBuildDetails, err := base64.StdEncoding.DecodeString(args[1])
	if err != nil {
		fmt.Println("Failed to decode build details", err)
		return nil
	}
	if err = json.Unmarshal(base64DecodedBuildDetails, &buildDetails); err != nil {
		fmt.Println("Failed to parse build details", err)
		return nil
	}
	var secrets types.Secrets
	base64DecodedSecrets, err := base64.StdEncoding.DecodeString(args[2])
	if err != nil {
		fmt.Println("Failed to decode secrets")
		return nil
	}
	if err = json.Unmarshal(base64DecodedSecrets, &secrets); err != nil {
		fmt.Println("Failed to parse secrets", err)
		return nil
	}
	return &types.ArgValues{
		MaxDuration:  maxDuration,
		BuildDetails: buildDetails,
		Secrets:      secrets,
	}
}

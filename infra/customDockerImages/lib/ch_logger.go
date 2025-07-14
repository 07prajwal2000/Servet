package lib

import (
	"context"
	"fmt"

	"github.com/07prajwal2000/servet/types"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

type ClickhouseLogger struct {
	Conn         driver.Conn
	BuildDetails *types.BuildDetails
	Notifier     *RedisNotify
}

func NewClickhouseLogger(conn driver.Conn, buildDetails *types.BuildDetails, notifier *RedisNotify) *ClickhouseLogger {
	return &ClickhouseLogger{
		Conn:         conn,
		BuildDetails: buildDetails,
		Notifier:     notifier,
	}
}

func (c *ClickhouseLogger) LogInfo(value string) {
	ctx := context.Background()
	fmt.Println("INFO: ", value)
	err := c.Conn.Exec(ctx, "insert into logs (level, message, project_id) values ('info', $1, $2)", value, c.BuildDetails.Id)
	if err != nil {
		fmt.Println(err)
	}
	c.Notifier.NotifyLogAdded()
}

func (c *ClickhouseLogger) LogError(value string) {
	ctx := context.Background()
	fmt.Println("ERROR: ", value)
	err := c.Conn.Exec(ctx, "insert into logs (level, message, project_id) values ('error', $1, $2)", value, c.BuildDetails.Id)
	if err != nil {
		fmt.Println(err)
	}
	c.Notifier.NotifyLogAdded()
}

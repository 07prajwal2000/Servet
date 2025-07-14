package lib

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/redis/go-redis/v9"
)

type NotifyType string

const (
	LogAdded     NotifyType = "log_added"
	BuildStarted NotifyType = "build_started"
	BuildError   NotifyType = "build_error"
	BuildSuccess NotifyType = "build_success"
)

type RedisNotify struct {
	channel   string
	projectId int
	conn      *redis.Client
}

type NotifyValue struct {
	Type  NotifyType
	Value any
}

func NewRedisNotifier(projectId int, conn *redis.Client) *RedisNotify {
	return &RedisNotify{
		fmt.Sprintf("notify_%d", projectId),
		projectId,
		conn,
	}
}

func (r *RedisNotify) NotifyLogAdded() {
	data, _ := json.Marshal(&NotifyValue{
		Type:  LogAdded,
		Value: "",
	})
	r.conn.Publish(context.Background(), r.channel, string(data))
}

func (r *RedisNotify) NotifyBuildStarted() {
	data, _ := json.Marshal(&NotifyValue{
		Type:  BuildStarted,
		Value: "",
	})
	r.conn.Publish(context.Background(), r.channel, string(data))
}

func (r *RedisNotify) NotifyBuildError() {
	data, _ := json.Marshal(&NotifyValue{
		Type:  BuildError,
		Value: "",
	})
	r.conn.Publish(context.Background(), r.channel, string(data))
}

func (r *RedisNotify) NotifyBuildSuccess() {
	data, _ := json.Marshal(&NotifyValue{
		Type:  BuildSuccess,
		Value: "",
	})
	r.conn.Publish(context.Background(), r.channel, string(data))
}

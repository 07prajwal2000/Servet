package lib

import (
	"fmt"
	"io"
	"os/exec"
	"sync"
)

const (
	BUFFER_SIZE = 512
	LEVEL_INFO  = byte(1)
	LEVEL_ERROR = byte(2)
)

type LogEvent struct {
	Log   string
	Done  bool
	Error error
	// 1 - info, 2 - error
	Level byte
}

type Exec struct {
	binary  string
	args    []string
	wg      sync.WaitGroup
	Channel chan *LogEvent
}

func NewCliExecutor(binary string, args ...string) *Exec {
	return &Exec{
		binary,
		args,
		sync.WaitGroup{},
		make(chan *LogEvent),
	}
}

func (e *Exec) Run() {
	command := exec.Command(e.binary, e.args...)
	readPipe, _ := command.StdoutPipe()
	readErrPipe, _ := command.StderrPipe()
	go e.readPipe(&readPipe, LEVEL_INFO)
	go e.readPipe(&readErrPipe, LEVEL_ERROR)
	command.Start()
	e.wg.Wait()
	exitCode := command.ProcessState.ExitCode()
	if exitCode != 0 {
		e.Channel <- &LogEvent{
			Log:   fmt.Sprintf("Process returned exit code %d", exitCode),
			Done:  true,
			Error: command.Err,
			Level: LEVEL_ERROR,
		}
		return
	}
	e.Channel <- &LogEvent{
		Log:   "",
		Done:  true,
		Error: nil,
		Level: LEVEL_INFO,
	}
}

func (e *Exec) readPipe(pipe *io.ReadCloser, level byte) {
	buf := make([]byte, BUFFER_SIZE)
	e.wg.Add(1)
	defer e.wg.Done()
	for {
		totalRead, err := (*pipe).Read(buf)
		if totalRead == 0 || err != nil {
			break
		}
		e.Channel <- &LogEvent{
			Log:   string(buf[:totalRead]),
			Done:  false,
			Error: err,
			Level: level,
		}
	}
}

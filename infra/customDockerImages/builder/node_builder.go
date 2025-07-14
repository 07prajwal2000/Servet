package builder

import (
	"os"
	"strings"

	"github.com/07prajwal2000/servet/lib"
)

type NodeBuilder struct {
	builder *Builder
}

func NewNodeBuilder(b *Builder) *NodeBuilder {
	return &NodeBuilder{
		builder: b,
	}
}

func (b *NodeBuilder) InstallPackages() error {
	b.builder.Logger.LogInfo("Installing Packages")
	commands := strings.Split(b.builder.BuildDetails.InstallCommand, " ")
	cmd := lib.NewCliExecutor(commands[0], commands[1:]...)
	go cmd.Run()
	for event := range cmd.Channel {
		if event.Error != nil {
			b.builder.Logger.LogError(event.Error.Error())
			return event.Error
		}
		if event.Done {
			b.builder.Logger.LogInfo("Packages Installed Successfully")
			break
		}
	}
	return nil
}

func (b *NodeBuilder) BuildProject() error {
	b.builder.Logger.LogInfo("Building Project")
	commands := strings.Split(b.builder.BuildDetails.BuildCommand, " ")
	cmd := lib.NewCliExecutor(commands[0], commands[1:]...)
	go cmd.Run()
	for event := range cmd.Channel {
		if event.Error != nil {
			b.builder.Logger.LogError(event.Error.Error())
			return event.Error
		}
		if event.Done {
			b.builder.Logger.LogInfo("Project Built Successfully")
			break
		}
		b.builder.Logger.LogInfo(event.Log)
	}
	os.Chdir(b.builder.BuildDetails.OutputDirectory)
	return nil
}

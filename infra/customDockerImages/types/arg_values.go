package types

type BuildDetails struct {
	Id                   int    `json:"id"`
	DeployKind           string `json:"deployKind"`
	BuildRuntime         string `json:"buildRuntime"`
	Url                  string `json:"url"`
	InstallCommand       string `json:"installCommand"`
	BuildCommand         string `json:"buildCommand"`
	RootDirectory        string `json:"rootDirectory"`
	OutputDirectory      string `json:"outputDirectory"`
	ApplicationSubDomain string `json:"applicationSubDomain"`
}

type Secrets struct {
	ClickhouseHost     string `json:"clickhouseHost"`
	ClickhousePort     int    `json:"clickhousePort"`
	ClickhouseUser     string `json:"clickhouseUser"`
	ClickhousePassword string `json:"clickhousePassword"`
	ClickhouseDatabase string `json:"clickhouseDatabase"`
	PostgresConnection string `json:"postgresConnection"`
	RedisConnection    string `json:"redisConnection"`
	S3Endpoint         string `json:"S3_ENDPOINT"`
	S3Key              string `json:"S3_KEY"`
	S3Secret           string `json:"S3_SECRET"`
}

type ArgValues struct {
	MaxDuration  int
	BuildDetails BuildDetails
	Secrets      Secrets
}

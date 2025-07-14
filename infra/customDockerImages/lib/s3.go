package lib

import (
	"context"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type S3 struct {
	bucketName string
	client     *minio.Client
}

func NewS3(endpoint, key, secret, bucketName string) *S3 {
	minioClient, _ := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(key, secret, ""),
		Secure: false,
	})
	return &S3{
		bucketName,
		minioClient,
	}
}

func (s *S3) UploadFile(objectName, filePath string) error {
	ctx := context.Background()
	_, err := s.client.FPutObject(ctx, s.bucketName, objectName, filePath, minio.PutObjectOptions{})
	if err != nil {
		return err
	}
	return nil
}

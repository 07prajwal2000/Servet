import path from "path";
import { z } from "zod";

export enum DeployKind {
	Zip = "zip",
	Build = "build",
	CustomDockerImg = "custom-docker-img",
}

export enum Runtime {
	Node = "node",
	Python = "python",
	Docker = "docker",
}

export enum BuildStatus {
	Pending = "pending",
	Building = "building",
	Success = "success",
	Failed = "failed",
}

export interface BuildSchedule {
	id: number;
	status: BuildStatus;
	deploy_kind: DeployKind;
	build_runtime: Runtime;
	url: string;
	install_command: string;
	build_command: string;
	root_directory: string;
	output_directory: string;
	docker_image: string;
	app_domain: string;
	created_at: Date;
}

export const schema = z.object({
  deployKind: z.string().refine(value => {
		if (value != DeployKind.Zip && value != DeployKind.Build && value != DeployKind.CustomDockerImg) return false;
		return true;
	}),
	buildRuntime: z.string().refine(value => {
		if (value != Runtime.Node && value != Runtime.Python && value != Runtime.Docker) return false;
		return true;
	}),
  url: z.string().url().default(""),
  installCommand: z.string().min(1).optional(),
  buildCommand: z.string().min(1).optional(),
  rootDirectory: z.string().default(""),
  outputDirectory: z.string().default(""),
  dockerImage: z.string().default("").optional(),
  applicationSubDomain: z.string().min(3).max(10),
});

export function validateData(data: ScheduleBuildDto): boolean {
	if (data.deployKind == DeployKind.Zip) {
		if (!data.url) return false;
	}
	if (data.deployKind == DeployKind.Build) {
		if (data.buildRuntime == "docker") return false;
		return true
	}

	if (data.deployKind == DeployKind.CustomDockerImg && !data.dockerImage) return false;

	return true;
}

export type ScheduleBuildDto = z.infer<typeof schema>;

export type BuildResponse = {
  message: string;
  data?: {
    buildId: string;
  };
};
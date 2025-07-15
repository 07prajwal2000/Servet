import { hashId } from "../../lib/hashid";
import { kafkaProducer } from "../../lib/kafka";
import { SQL } from "../../lib/postgres";
import {
	BuildResponse,
	BuildStatus,
	DeployKind,
	Runtime,
	ScheduleBuildDto,
} from "./schema";

export async function scheduleBuildServer(
	data: ScheduleBuildDto
): Promise<BuildResponse> {
  if (data.buildRuntime == Runtime.Docker || data.deployKind == DeployKind.CustomDockerImg || data.deployKind == DeployKind.Zip) {
    return {
      message: 'Still in development'
    };
  }
  console.log(data);
	// save to postgres
	const build = await SQL<
		{ id: string }[]
	>`insert into build_schedule (status, deploy_kind, build_runtime, url, install_command, build_command, root_directory, output_directory, docker_image, app_domain) 
  values (${BuildStatus.Pending}, ${data.deployKind}, ${data.buildRuntime}, ${data.url}, ${data.installCommand || ''}, ${data.buildCommand || ''}, ${data.rootDirectory || ''}, ${data.outputDirectory || ''}, ${data.dockerImage || ''}, ${data.applicationSubDomain})
  returning id;`;

	if (!build[0].id) {
		return {
			message: "Build schedule failed",
		};
	}

	// generate build id
	const buildId = build[0].id;

	// send to kafka topic
	const nodeTopic = process.env.KAFKA_NODE_TOPIC!;
	const pythonTopic = process.env.KAFKA_PYTHON_TOPIC!;
	const dockerTopic = process.env.KAFKA_DOCKER_TOPIC!;

	let topic = "";
	switch (data.buildRuntime) {
		case Runtime.Node:
			topic = nodeTopic;
			break;
		case Runtime.Python:
			topic = pythonTopic;
			break;
    // @ts-ignore
		case Runtime.Docker:
			topic = dockerTopic;
			break;
	}

	await kafkaProducer.send({
		topic,
		messages: [
			{
				value: JSON.stringify({
					id: build[0].id,
					...data,
				}),
			},
		],
	});

	return {
		data: {
			buildId,
		},
		message: "",
	};
}
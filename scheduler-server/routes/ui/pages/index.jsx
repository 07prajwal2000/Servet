import { Layout } from "../layout";

const Index = () => {
	const kind = {
		Zip: "zip",
		Build: "build",
		CustomDockerImg: "custom-docker-img",
	};

	const runtime = {
		Node: "node",
		Python: "python",
		Docker: "docker",
	};

	return (
		<Layout>
			<div class={"container row mx-auto justify-content-center"}>
				<div class={"col-6"}>
					<form
						action={"/build"}
						x-data={`{kind: '${kind.Build}', runtime: '${runtime.Node}', url: '', installCommand: '', buildCommand: '', rootDir: '', outputDir: '', image: '', subdomain: ''}`}
						class={"row border border-2 rounded p-2 mt-4"}
						method="post"
					>
						<div class={"row"}>
							<div
								x-on:click={`kind='${kind.Zip}'`}
								x-bind:class={`'col-4 btn ' + (kind=='${kind.Zip}' ? 'btn-primary' : '') `}
							>
								{kind.Zip.toUpperCase()}
							</div>
							<div
								x-on:click={`kind='${kind.Build}'`}
								x-bind:class={`'col-4 btn ' + (kind=='${kind.Build}' ? 'btn-primary' : '') `}
							>
								{kind.Build.toUpperCase()}
							</div>
							<div
								x-on:click={`kind='${kind.CustomDockerImg}'`}
								x-bind:class={`'col-4 btn ' + (kind=='${kind.CustomDockerImg}' ? 'btn-primary' : '') `}
							>
								{kind.CustomDockerImg.toUpperCase().replaceAll("-", " ")}
							</div>
						</div>
						<input
							type="text"
							class={"d-none"}
							name="deployKind"
							x-bind:value="kind"
						/>
						{/* Build section */}
						<div className="row p-4 gap-3" x-show={`kind=='${kind.Build}'`}>
							<label>
								Select Runtime
								<select
									name="buildRuntime"
									x-on:change="runtime = $el.value"
									class={"form-select"}
								>
									<option value={runtime.Node}>
										{runtime.Node.toUpperCase()}
									</option>
									<option value={runtime.Python}>
										{runtime.Python.toUpperCase()}
									</option>
									<option value={runtime.Docker}>
										{runtime.Docker.toUpperCase()} (Under Development)
									</option>
								</select>
							</label>
							<label>
								Public Git URL
								<input
									type="text"
									class={"form-control"}
									name="url"
									x-on:keyup="url = $el.value"
								/>
							</label>
							<label>
								Install Command
								<input
									type="text"
									class={"form-control"}
									name="installCommand"
									x-on:keyup="installCommand = $el.value"
								/>
							</label>
							<label>
								Build Command
								<input
									type="text"
									class={"form-control"}
									name="buildCommand"
									x-on:keyup="buildCommand = $el.value"
								/>
							</label>
							<label>
								Root Directory
								<input
									type="text"
									class={"form-control"}
									name="rootDirectory"
									x-on:change="rootDir = $el.value"
								/>
							</label>
							<label>
								Output Directory
								<input
									type="text"
									class={"form-control"}
									name="outputDirectory"
									x-on:change="outputDir = $el.value"
								/>
							</label>
							<label>
								Application SubDomain
								<input
									type="text"
									class={"form-control"}
									name="applicationSubDomain"
									x-on:change="subdomain = $el.value"
								/>
							</label>
              <button type="submit" class="btn btn-primary">Deploy</button>
						</div>
						{/* Zip section */}
						<div className="row text-center p-4" x-show={`kind=='${kind.Zip}'`}>
							<h1>UNDER DEVELOPMENT</h1>
						</div>
						{/* Custom Docker section */}
						<div
							className="row text-center p-4"
							x-show={`kind=='${kind.CustomDockerImg}'`}
						>
							<h1>UNDER DEVELOPMENT</h1>
						</div>
					</form>
				</div>
			</div>
		</Layout>
	);
};

export default Index;

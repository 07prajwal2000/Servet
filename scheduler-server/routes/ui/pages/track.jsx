import { Layout } from "../layout";

export function TrackPage() {
	return (
		<Layout>
			<div x-data className="container-fluid p-4">
				{/* Build Status Card */}
				<div className="card mb-4">
					<div className="card-header bg-primary text-white">
						<h5 className="mb-0">Build Status</h5>
					</div>
					<div className="card-body">
						<form className="row g-3">
							<div className="col-md-6">
								<label className="form-label">Status</label>
								<div
									x-text="$store.globalData.buildDetails?.status"
									className="form-control-plaintext bg-light p-2 rounded"
								/>
							</div>
							<div className="col-md-6">
								<label className="form-label">Created At</label>
								<div
									x-text="new Date($store.globalData.buildDetails?.created_at).toLocaleString()"
									className="form-control-plaintext bg-light p-2 rounded"
								/>
							</div>
							<div className="col-md-4">
								<label className="form-label">Runtime</label>
								<div
									x-text="$store.globalData.buildDetails.build_runtime"
									className="form-control-plaintext bg-light p-2 rounded"
								/>
							</div>
							<div className="col-md-4">
								<label className="form-label">App Domain</label>
								<button
									type="button"
									className="btn bg-light p-2 rounded text-truncate w-100 text-start border-0"
									x-text="$store.globalData.buildDetails.app_domain"
									x-on:click="window.open('http://' + $store.globalData.buildDetails.app_domain + '.localhost:8080/index.html', '_blank')"
									x-bind:title="$store.globalData.buildDetails.app_domain"
								/>
							</div>
							<div className="col-md-4">
								<label className="form-label">Git Url</label>
								<button
									type="button"
									className="btn bg-light p-2 rounded text-truncate w-100 text-start border-0"
									x-text="$store.globalData.buildDetails.url"
									x-on:click="window.open($store.globalData.buildDetails.url, '_blank')"
									x-bind:title="$store.globalData.buildDetails.url"
								/>
							</div>
						</form>
					</div>
				</div>

				{/* Logs Viewer Card */}
				<div className="card" x-data>
					<div className="card-header bg-dark text-white">
						<h5 className="mb-0">Build Logs</h5>
					</div>
					<pre
						className="card-body bg-light text-dark p-3 mb-0"
						style={{ maxHeight: "500px", overflowY: "auto" }}
					>
						<template
							x-if="$store.globalData.logs.length != 0"
							x-for="(log, index) in $store.globalData.logs"
						>
							<div className="font-monospace small mb-1 log-line-hover">
								<div className="d-flex justify-content-between">
									<span
										x-text="new Date(log.timestamp).toLocaleString()"
										className="text-muted"
									/>
									<span
										x-text="log.level.toUpperCase()"
										x-bind:class="log.level === 'error' ? 'text-danger fw-bold' : 'text-info'"
									/>
								</div>
								<div
									x-text="log.line"
									x-bind:class="log.level === 'error' ? 'text-danger' : 'text-dark'"
									style={{
										"text-wrap": "wrap",
									}}
								/>
							</div>
						</template>
						<p
							x-if="$store.globalData.logs.length == 0"
							className="text-center text-muted"
						>
							No logs yet
						</p>
					</pre>
				</div>
			</div>
			<script src="https://cdn.socket.io/4.8.1/socket.io.min.js" />
			<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.10.0/axios.min.js" />
			<script src="/static/track.js" />
		</Layout>
	);
}

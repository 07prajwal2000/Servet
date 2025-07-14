import { Layout } from "../layout";

export function TrackPage() {
	return (
		<Layout>
			<div x-data>
				<h2 x-text="$store.state.buildId"></h2>
			</div>
			<script src="https://cdn.socket.io/4.8.1/socket.io.min.js" />
			<script src="/static/track.js" />
		</Layout>
	);
}

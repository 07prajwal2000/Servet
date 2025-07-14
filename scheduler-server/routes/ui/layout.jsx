export function Layout({ children }) {
	return (
		<html>
			<script src="//unpkg.com/alpinejs" defer></script>
			<link
				href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css"
				rel="stylesheet"
				/>
			<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js" />
			<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/1.10.0/axios.min.js" />
			<body x-if="true">{children}</body>
		</html>
	);
}

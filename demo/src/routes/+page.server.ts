export const load = async ({}) => {
	const repoUrl = 'https://github.com/beynar/syncrostate';
	const readme = await fetch(`${repoUrl}/blob/main/README.md`);
	const readmeText = await readme.text();
	return {
		readme: readmeText
	};
};

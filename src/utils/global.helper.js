module.exports = {
	toNumber: (str) => {
		const response = Number(str);
		return Number.isNaN(response) ? 0 : response;
	},
};

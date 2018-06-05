import logger from './winston.logger';


export default (req, res, next) => {
	// nginx proxy header : proxy_set_header  X-Real-IP  $remote_addr;
	const ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

	const log = {
		ip,
		hostname: req.hostname,
		path: req.path,
		url: req.url,
		query: req.query,
		time: Date.now(),
	};

	logger.info(log);
	next();
};

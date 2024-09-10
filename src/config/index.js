async function loadConfiguration() {
    let APP_CONFIG;
    if (process.env.NODE_ENV === 'development') {
        APP_CONFIG = (await import('./config.development')).default;
    } else if (process.env.NODE_ENV === 'production') {
        APP_CONFIG = null;
    } else {
        APP_CONFIG = null;
    }
    return APP_CONFIG;
}

const APP_CONFIG_PROMISE = loadConfiguration();
export default APP_CONFIG_PROMISE;

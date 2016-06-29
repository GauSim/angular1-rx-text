const Builder = require('systemjs-builder');

/**
 * Task to create SystemJS bundles
 * this task will take an
 * @param typescriptOutDir => path to dir to the SystemJS-Modules
 * @param moduleBaseConfigFile => path to SystemJS-Configfile
 * @param bundleEntryPoint => Module name that will be bundled
 * @param bundleOutputFilename => output file name
 * @param mode => 'bundle' || 'buildStatic'
 */
function bundleTask(typescriptOutDir, moduleBaseConfigFile, bundleEntryPoint, bundleOutputFilename, mode) {

    console.log("[INFO] creating bundle:", bundleEntryPoint);

    moduleBaseConfigFile = (typescriptOutDir + moduleBaseConfigFile);
    console.log("[INFO] with config: ", moduleBaseConfigFile);

    bundleOutputFilename = (typescriptOutDir + bundleOutputFilename);

    const builder = new Builder(typescriptOutDir, moduleBaseConfigFile);

    const publicAssetRoute = "dist/build/";

    const bundleConfig = {
        outFile: bundleOutputFilename,
        mangle: true,
        minify: true,
        sourceMaps: true,
        fetch: function (file, fetch) {
            // to include 3rd party libs in our bundle we overwrite the file path when the bundle is created
            // in this way we can bundle in certain dependencies but for other do a async load to share them on client cache


            if (file && file.metadata && file.metadata.build === true) {
                const fullFilePath = file.address.replace(publicAssetRoute, '');
                const _file = Object.assign({}, file, {address: fullFilePath});
                console.log('including 3rd party lib in bundle: ', _file.address);
                return fetch(_file);
            }
            return fetch(file);
        }
    };

    return builder[mode](bundleEntryPoint, bundleConfig)
        .then(function (jsFile) {
            console.log('[DONE] Build complete', bundleOutputFilename);
        })
        .catch(function (err) {
            console.error('Build error', err);
        });
}

const selfExecuting = 'buildStatic';
const bundle = 'bundle';

return bundleTask('dist/build/', 'systemjs.config.js', 'index.js', 'bundle.js', bundle)
    .then(function (ok) {
        console.log('DONE');
    });

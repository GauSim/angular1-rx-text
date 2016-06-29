(function (global) {
    // map tells the System loader where to look for things
    var map = {
        'app': 'dist/build/',
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'app': {
            main: 'index.js',
            defaultExtension: 'js',
        }
    };

    const paths = {
        'underscore': 'node_modules/underscore/underscore-min.js',
        'angular': 'node_modules/angular/angular.min.js',
        'angular-translate': 'node_modules/angular-translate/dist/angular-translate.js'
    };


    const meta = {};
    Object.keys(paths).forEach(function (key) {
        meta[key] = {
            build: true,
            format: 'global'
        }
    });

    const config = {
        defaultJSExtensions: true,
        map: map,
        packages: packages,
        paths: paths,
        meta: meta
    };

    System.config(config);

})(this);
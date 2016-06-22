/**
 * System configuration for Angular 2 samples
 * Adjust as necessary for your application needs.
 */
(function (global) {
    // map tells the System loader where to look for things
    var map = {
        'app': 'dist',
        'angular': 'node_modules/angular/',
        'angular-translate': 'node_modules/angular-translate/dist',
        'underscore': 'node_modules/underscore'
    };
    // packages tells the System loader how to load when no filename and/or no extension
    var packages = {
        'app': {
            main: 'index.js',
            defaultExtension: 'js'
        },
        'angular': {
            main: 'angular.min.js',
            defaultExtension: 'js',
            format: 'global', // load this module as a global
            exports: 'angular', // the global property to take as the module value
            deps: [
                // dependencies to load before this module
                'jquery'
            ]
        },
        'angular-translate': {
            main: 'angular-translate.js',
            defaultExtension: 'js'
        },
        underscore: {
            main: 'underscore-min.js',
            defaultExtension: 'js'
        }
    };

    var config = {
        map: map,
        packages: packages
    }

    System.config(config);

})(this);
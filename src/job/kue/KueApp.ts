import Kue = require('kue');
import Cluster = require('cluster');
const BasicAuth = require('basic-auth-connect');
import Express = require('express');
import Logger = require('../../Logger');


export default class KueApp {

    constructor() {
        this.logger = Logger.create('KueApp');
    }


    /* eslint no-process-env:'off' */
    initOnce() {
        if( this.inited ) return;
        this.inited = true;
        
        if( !Cluster.isMaster ) return;

        const cfg = global.config;

        const kueApp = cfg.kueApp = cfg.kueApp || {};

        kueApp.enabled = kueApp.enabled || (process.env.NODE_ENV !== 'prod');
        kueApp.title = kueApp.title;
        kueApp.description = kueApp.description;
        kueApp.port = kueApp.port || 3003;
        kueApp.user = kueApp.user || 'alice';
        kueApp.password = kueApp.password || 'pwd';

        if( !kueApp.enabled ) {
            this.logger.info( `kue ui for ${kueApp.title} is not enabled` );
            return;
        }

        Kue.app.set( kueApp.title, kueApp.description );
        //Kue.app.listen(kueApp.port);

        const expressApp = Express();//{ ... tls options ... });

        expressApp.use(BasicAuth( kueApp.user, kueApp.password ));
        expressApp.use(Kue.app);
        expressApp.listen(kueApp.port);

        this.logger.info( `kue ui for ${kueApp.title} is listening on ${kueApp.port}` );
    }

}


KueApp.instance = new KueApp();


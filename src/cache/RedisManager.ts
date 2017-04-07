import _ = require('lodash');
import RedisInstance = require('./RedisInstance');


/**
 * redis实例管理类。
 * 这个类管理了一个实例注册表（实例名映射到实例对象）。
 * 每一个实例都是按需创建，即，不被使用时不会被创建。
 */
export default class RedisManager {

    constructor() {
        this.instances = {}; // 保存实例名字到实例对象的映射关系
        this.defaultInstance = null; // 缺省实例
    }

    /**
     * 通过名字查找实例。
     * 
     * @param instanceName 实例名字。如果非空（大部分微服务只需要连接单一redis，所以通常不需要指定实例名字），那么取缺省实例。
     */
    get( instanceName ) {
        let r = instanceName ? this.instances[instanceName] : this.defaultInstance;

        if( !r ) {
            // 如果指定名字的实例尚未创建，那么在这里创建它
            this.instances[instanceName] = r = this.create(instanceName);
            if( !this.defaultInstance && !instanceName ) this.defaultInstance = r;//如果缺省实例还没有设定，那么在这里设定
        }

        return r;
    }

    /**
     * 创建一个实例
     */
    create( instanceName ) {
        let instanceConfig;
        const globalConfig = global.config.redis;
        if( !instanceName ) {
            instanceConfig = globalConfig;
        } else {
            if( !globalConfig[instanceName] ) throw new Error('please configure section: redis.' + instanceName);

            instanceConfig = _.cloneDeep(globalConfig);
            _.merge( instanceConfig, globalConfig[instanceName] );
            globalConfig[instanceName] = instanceConfig;
        }

        return new RedisInstance( instanceName, instanceConfig );
    }

}

RedisManager.instance = new RedisManager();

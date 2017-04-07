import TestContext = require('./TestContext');
import Util = require('util');
import Sinon = require('sinon');


export default class TestSuite {

    constructor() {
        this.ctx = null;
    }

    beforeEach() {
        this.ctx = new TestContext();

        this.sinons = [];

        return Promise.resolve();
    }

    stubWithMethod( object, methodName, func ) {
        const r = Sinon.stub( object, methodName, func );
        this.sinons.push(r);
        return r;
    }

    spyWithMethod( object, methodName ) {
        const r = Sinon.spy( object, methodName );
        this.sinons.push(r);
        return r;
    }


    afterEach() {
        this.sinons.forEach( sinon => sinon.restore() );

        return Promise.resolve();
    }


    static exportsClass( suiteClass ) {
        const pt = suiteClass.prototype;

        global.bearcat.module(suiteClass);
        const test = global.bearcat.getBean(suiteClass.name);

        const suite = {
            //before: before,
            beforeEach: pt.beforeEach.bind(test),
            afterEach: pt.afterEach.bind(test)
        };

        // 遍历取得所有的前缀是test的方法，然后把这些方法bind到test并加入suite
        for( let propName of Object.getOwnPropertyNames(pt) ) {
            if( propName.indexOf('test') !== 0 ) continue;
            let prop = pt[propName];
            if( Util.isFunction(prop) ) {
                suite[propName] = prop.bind(test);
            }
        }

        const result = {};
        result[suiteClass.name] = suite;
        return result;
    }

}

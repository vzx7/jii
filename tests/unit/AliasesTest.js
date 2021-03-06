'use strict';

const Jii = require('../../index');
const UnitTest = require('../../base/UnitTest');
require('../bootstrap');
class self extends UnitTest {

    aliasesTest(test) {
        const jiiPath = require('fs').realpathSync(__dirname + '/../..');
        test.strictEqual(jiiPath, Jii.getAlias('@jii'));

        Jii.aliases = {};
        test.strictEqual(Jii.getAlias('@jii', false), false);

        Jii.setAlias('@jii', '/jii/lib');
        test.strictEqual(Jii.getAlias('@jii'), '/jii/lib');
        test.strictEqual(Jii.getAlias('@jii/test/file'), '/jii/lib/test/file');

        Jii.setAlias('@jii/gii', '/jii/gii');
        test.strictEqual(Jii.getAlias('@jii'), '/jii/lib');
        test.strictEqual(Jii.getAlias('@jii/test/file'), '/jii/lib/test/file');
        test.strictEqual(Jii.getAlias('@jii/gii'), '/jii/gii');
        test.strictEqual(Jii.getAlias('@jii/gii/file'), '/jii/gii/file');

        Jii.setAlias('@tii', '@jii/test');
        test.strictEqual(Jii.getAlias('@tii'), '/jii/lib/test');

        Jii.setAlias('@jii', null);
        test.strictEqual(Jii.getAlias('@jii', false), false);
        test.strictEqual(Jii.getAlias('@jii/gii/file'), '/jii/gii/file');

        Jii.setAlias('@some/alias', '/www');
        test.strictEqual(Jii.getAlias('@some/alias'), '/www');

        test.done();
    }

}
module.exports = new self().exports();
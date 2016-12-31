const path = require('path');
const should = require('chai').should();
const getPackageJson = require('../app/get-package-json');

describe('Load a package.json file', function() {
  const cwd = process.cwd();

    afterEach(function() {
      process.chdir(cwd);
    });

  describe('find package.json', function() {

    it('Finds package.json in same dir', function() {
      process.chdir('./test/fixture/deep/dotfile/');
      const pkg = getPackageJson({quiet: true});
      pkg.should.have.deep.property('pkg.name', 'version-everything-test-fixture');
      pkg.should.have.deep.property('pkg.version', '9.8.7');
    });

    it('Finds package.json from a subdir', function() {
      process.chdir('./test/fixture/deep/dotfile/deeper/and_deeper');
      const pkg = getPackageJson({quiet: true});
      pkg.should.have.deep.property('pkg.name', 'version-everything-test-fixture');
      pkg.should.have.deep.property('pkg.version', '9.8.7');
    });

    it('Errors trying to find an ancestor package.json file', function() {
      process.chdir('/');
      const pkg = function() { getPackageJson({quiet: true}); };
      pkg.should.throw();
    });

  });

  describe('load specific package.json file', function() {

    it('Load a specific package.json file', function() {
      const pkg = getPackageJson({
        package_json: './test/fixture/deep/dotfile/package.json',
        quiet: true
      });
      pkg.should.have.deep.property('pkg.name', 'version-everything-test-fixture');
      pkg.should.have.deep.property('pkg.version', '9.8.7');
    });

  });

  describe('Test invalid file errors', function() {

    it('Errors trying to load an version-less package.json file', function() {
      const pkg = function() {
        getPackageJson({
          package_json: './test/fixture/no-version.json'
        });
      };
      pkg.should.throw(Error);
    });

    it('Errors trying to load a non-json text file', function() {
      const pkg = function() {
        getPackageJson({
          package_json: './test/fixture/not-really-data.txt'
        });
      };
      pkg.should.throw();
    });

  });
});


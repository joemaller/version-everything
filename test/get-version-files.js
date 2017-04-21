/* eslint-env node,mocha,chai */
/* eslint no-unused-vars: "should"*/

'use strict';

const should = require('chai').should();

const path = require('path');

const tmpFixture = require('../app/lib/tmp-fixture');

const getVersionFiles = require('../app/get-version-files');

const fakePackageJson = {
  pkg: {
    name: 'fake-package-json',
    version: '11.22.33',
    description: 'Fake package.json for testing',
    version_files: ["file1.js", "file2.json", "file3.yml", "file4.xml", "file5.php"]
  },
  path: './test/fixture/deep/'
};

const cwd = process.cwd();
const fixtureDir = './test/fixture/';

/**
 * for version_files testing:
 *   strings:       1 file
 *   arrays:        2 files
 *   objects:       3 files
 *   dotfiles:      4 files
 *   fake package.json:  5 files
 */

describe('Get a list of files to version', function() {
  beforeEach('refresh fixtures to tempfile', function() {
    process.chdir(tmpFixture(fixtureDir));
  });

  afterEach('clean up tmpDir', function() {
    process.chdir(cwd);
  });

  describe('accepts a variety of config arguments', function() {
    it('Handles a single file as a string', function() {
      let files = getVersionFiles('file1.js');
      files.should.be.an('array');
      files.should.have.a.lengthOf(1);
    });

    it('Handles an array of files', function() {
      let files = getVersionFiles(['file1.js', 'file2.json']);
      files.should.be.an('array');
      files.should.have.a.lengthOf(2);
    });

    it('Handles an object with a files array', function() {
      let files = getVersionFiles({
        files: ['file1.js', 'file2.json', 'file3.yml']
      });
      files.should.be.an('array');
      files.should.have.a.lengthOf(3);
    });

    it('Handles an object with a file string', function() {
      let files = getVersionFiles({
        files: 'file1.js'
      });
      files.should.be.an('array');
      files.should.have.a.lengthOf(1);
    });
  });


  describe('gets files from a .version-everything.js file', function() {

    it('loads a .version-everything.js as sibilng of specified package.json file', function() {
      let files = getVersionFiles([], {path: './deep/dotfile/package.json'});
      files.should.be.an('array');
      files.should.have.a.lengthOf(4);
    });

    it('find .version-everything.js in nested dir', function() {
      let files = getVersionFiles([], {path: './deep/dotfile/deeper/and_deeper'});
      files.should.be.an('array');
      files.should.have.a.lengthOf(4);
    })

    it('finds .version-everything.js in parent dir', function() {
      let files = getVersionFiles([], {path: './deep/dotfile/deeper'});
      files.should.be.an('array');
      files.should.have.a.lengthOf(4);
    })
  });


  describe('gets files from package.json', function() {
    it('uses version_files from specified package.json file', function() {
      let files = getVersionFiles([], fakePackageJson);
      files.should.be.an('array');
      files.should.have.a.lengthOf(5);
    });
  });


  describe('handles various false values', function() {
    it('version_files is empty array', function() {
      const files = getVersionFiles([]);
      files.should.be.an('array');
      files.should.have.a.lengthOf(0);
    });

    it('version_files is false', function() {
      const files = getVersionFiles(false);
      files.should.be.an('array');
      files.should.have.a.lengthOf(0);
    });

    it('version_files is null', function() {
      const files = getVersionFiles(null);
      files.should.be.an('array');
      files.should.have.a.lengthOf(0);
    });

    it('version_files is undefined', function() {
      const undef = {};
      const files = getVersionFiles(undef.foo);
      files.should.be.an('array');
      files.should.have.a.lengthOf(0);
    });
  });

  describe('fails gracefully', function() {
    it('no arguments, no fallbacks', function() {
      let files = getVersionFiles();
      files.should.be.an('array');
      files.should.have.a.lengthOf(0);
    });
  });
});


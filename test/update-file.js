/* eslint-env node,mocha */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }]*/

'use strict';

const should = require('chai').should();
const assert = require('chai').assert;

const fs = require('fs-extra');
const semver = require('semver');

const tmpFixture = require('../app/lib/tmp-fixture');
const updateFile = require('../app/update-file');


describe('Update a file', function() {
  let newVersion = '1.0.0';
  const cwd = process.cwd();
  const fixtureDir = './test/fixture/deep/dotfile';

  beforeEach('refresh fixtures to tempfile', function() {
    newVersion = semver.inc(newVersion, 'patch');
    process.chdir(tmpFixture(fixtureDir));
  });


  afterEach('clean up tmpDir', function() {
    process.chdir(cwd);
  });


  it('requires a file argument', function() {
    const file = function() {
      updateFile();
    };
    file.should.throw(Error);
  });


  it('requires a version string argument', function() {
    const file = function() {
      updateFile('foo.file');
    };
    file.should.throw(Error);
  });


  it('accepts a string file path');
  it('accepts a filestream');

  describe('plain text files', function() {
    it('should report the previous version (css block comment)', function(done) {
      const file = 'file.css';
      updateFile(file, newVersion, {quiet: true}, (err, result) => {
        result.should.have.property('oldVersion');
        result.should.have.property('oldVersion').that.is.not.string(newVersion);
        result.should.have.property('oldVersion').that.is.not.undefined;
        done();
      });
    });

    it('should increment a plain text file (css block comment)', function(done) {
      const file = 'file.css';
      const regex = new RegExp('^\\s*(?:\\/\\/|#|\\*)*\\s*Version: ' + newVersion.replace(/\./g, '\\.'), 'im');
      updateFile(file, newVersion, {quiet: true}, (err) => {
        assert.ifError(err);
        fs.readFile(file, (err, data) => {
          data.toString().should.match(regex);
          done();
        });
      });
    });

    it('should report the previous version (php docblock comment)');

    it('should increment a plain text file (php docblock comment)', function(done) {
      const file = 'file.php';
      const regex = new RegExp('^\\s*(?:\\/\\/|#|\\*)*\\s*Version: ' + newVersion.replace(/\./g, '\\.'), 'im');
      updateFile(file, newVersion, {quiet: true}, (err) => {
        assert.ifError(err);
        fs.readFile(file, (err, data) => {
          data.toString().should.match(regex);
          done();
        });
      });
    });

    it('should report the previous version (markdown heading)');

    it('should increment a plain text file (markdown heading)', function(done) {
      const file = 'file.md';
      const regex = new RegExp('^\\s*(?:\\/\\/|#|\\*)*\\s*Version: ' + newVersion.replace(/\./g, '\\.'), 'im');
      updateFile(file, newVersion, {quiet: true}, (err) => {
        assert.ifError(err);
        fs.readFile(file, (err, data) => {
          data.toString().should.match(regex);
          done();
        });
      });
    });

    it('should update yaml frontmatter versions and text version strings in markdown documents');
    it('should update several version strings in the same file', function(done) {
      const file = 'decoy-version.md';
      updateFile(file, newVersion, {quiet: true}, (err) => {
        assert.ifError(err);
        fs.readFile(file, (err, data) => {
          data.toString().should.have.string('## Version: ' + newVersion);
          data.toString().should.have.string('### Version ' + newVersion);
          done();
        });
      });
    });

    it('should not update non-version titles that look like versions', function(done) {
      const file = 'decoy-version.md';
      updateFile(file, newVersion, {quiet: true}, (err) => {
        assert.ifError(err);
        fs.readFile(file, (err, data) => {
          data.toString().should.have.string('# Version decoy file');
          done();
        });
      });
    });

  });

  describe('JSON files', function() {

    it('should report the previous version (json file)');

    it('should increment a json file', function(done) {
      const file = 'file.json';
      updateFile(file, newVersion, {quiet: true}, (err) => {
        assert.ifError(err);
        fs.readJson(file, (err, json) => {
          assert.ifError(err);
          json.should.have.property('version', newVersion);
          done();
        });
      });
    });


    it('should increment a json file, also using a replacer array', function(done) {
      const file = 'file.json';
      const replacer = ['title', 'version'];
      updateFile(file, newVersion, {json: {replacer: replacer}, quiet: true}, (err) => {
        assert.ifError(err);
        fs.readJson(file, (err, json) => {
          assert.ifError(err);
          json.should.have.property('version', newVersion);
          json.should.have.property('title');
          json.should.not.have.property('double_me');
          done();
        });
      });
    });


    it('should increment a json file, also using a replacer function', function(done) {
      const file = 'file.json';
      const replacer = (key, value) => (key === 'double_me') ? value * 2 : value;
      updateFile(file, newVersion, {json: {replacer: replacer}, quiet: true}, (err) => {
        assert.ifError(err);
        fs.readJson(file, (err, json) => {
          json.should.have.property('version', newVersion);
          json.should.have.property('title');
          json.should.have.property('double_me', 10);
          done();
        });
      });
    });


    it('should increment a json file, also using a reviver function', function(done) {
      const file = 'file.json';
      const reviver = (key, value) => (key === 'double_me') ? value * 2 : value;
      updateFile(file, newVersion, {json: {reviver: reviver}, quiet: true}, (err, result) => {
        assert.ifError(err);
        fs.readJson(file, (err, json) => {
          json.should.have.property('version', newVersion);
          json.should.have.property('title');
          json.should.have.property('double_me', 10);
          done();
        });
      });
    });


    it('should increment a json file and set a specific indentation', function(done) {
      const file = 'file.json';
      const spaces = 4;
      const regex = new RegExp('^ {' + spaces + '}"version":', 'm');
      updateFile(file, newVersion, {json:{space: spaces}, quiet: true}, (err, result) => {
        assert.ifError(err);
        fs.readFile(file, (err, data) => {
          data.toString().should.match(regex);
          done();
        });
      });
    });

  });

  describe('XML files', function() {

    it('should report the previous version (xml file)');
    it('should increment the top-level version attribute in an xml file');
    it('should increment a top-level custom attribute in an xml file');
    it('should increment a nested custom attribute in an xml file');
    // TODO: Something like {key: 'project_version'} to update that key with the version

    it('should increment an xml plist file');

  });

  describe('YAML files', function() {

    it('should report the previous version (yaml file)');

    it('should increment a top-level attribute in a yaml file');
    // it('should increment a yaml file', function(done) {
    //   const file = 'file.yml';
    //   const regex = new RegExp('^version: ["\']' + newVersion, 'm');
    //   console.log('*&***************&*&*&*&*&*&    ' + regex );
    //   updateFile(file, newVersion, {}, (err, result) => {
    //     assert.ifError(err);
    //     fs.readFile(file, (err, data) => {
    //       // console.log(data.toString());
    //       data.toString().should.match(regex);
    //       // data.toString().should.match(/^     "version"/m);
    //       // assert.fail();
    //       done();
    //     });
    //   });
    // });
    it('should increment a top-level custom attribute in a yaml file');
    // TODO:  should be able to specify something like {key: '_playbook_version'} to update that key with the version
    it('should increment a nested custom attribute in a yaml file');

    it('should increment a plain-text coment in a yaml file');

    it('should increment yaml frontmatter in a markdown file');

  });

  describe('Files without extensions', function() {

    it('should increment a json file without a file extension', function(done) {
      const file = 'naked-json';
      updateFile(file, newVersion, {quiet: true}, (err) => {
        assert.ifError(err);
        fs.readJson(file, (err, json) => {
          json.should.have.property('version', newVersion);
          done();
        });
      });
    });


    it('should increment an xml file without a file extension');
    it('should increment a yaml file without a file extension');

  });

  describe('Files without versions', function() {

    it('should report the file was unversioned', function(done) {
      const file = 'no-version.json';
      try {
        updateFile(file, newVersion, {quiet: true}, (err, result) => {
          result.should.have.property('oldVersion');
          result.should.have.property('oldVersion').that.is.undefined;
          done();
        });
      } catch (err) {
        assert.ifError(err);
      }
    });


    it('adds version to version-less json file', function(done) {
      const file = 'no-version.json';
      updateFile(file, newVersion, {quiet: true}, (err) => {
        assert.ifError(err);
        fs.readJson(file, (err, json) => {
          json.should.have.property('version', newVersion);
          done();
        });
      });
    });

    it('adds version to version-less xml file');
    it('adds version to version-less yaml file');

    it('passes version-less plain files through unchanged', function(done) {
      const file = 'not-really-data.txt';
      const stats = fs.statSync(file);
      const content = fs.readFileSync(file, {encoding: 'utf8'});
      updateFile(file, newVersion, {quiet: true}, (err) => {
        assert.ifError(err);
        fs.readFile(file, (err, data) => {
          const newStats = fs.statSync(file);
          delete stats.atime;
          delete newStats.atime;
          // console.log(stats, newStats);
          newStats.should.deep.equal(stats);
          data.toString().should.equal(content);
          done();
        });
      });
    });

  });


  describe('Errors and Callbacks', function() {
    it('Throws an error on missing files', function(done) {
      const file = 'not-a-file.txt';
      updateFile(file, newVersion, {}, (err, result) => {
        err.should.be.instanceOf(Error);
        err.code.should.be.string('ENOENT');
        done();
      });
    });

    it('Throws an error when unable to read files (permissions)', function(done) {
      const file = 'file.json';
      fs.chmodSync(file, '0377');
      updateFile(file, newVersion, {quiet: true}, (err, result) => {
        err.should.be.instanceOf(Error);
        err.code.should.be.string('EACCES');
        done();
      });
    });

    it('Calls the callback when nothing happens', function(done) {
      const file = 'not-really-data.txt';
      try {
        updateFile(file, newVersion, {quiet: false}, (err, result) => {
          arguments.should.have.lengthOf(1);
          done();
        });
      } catch (err) {
        assert.ifError(err);
      }
    });
  });

  describe('Test output (console.log)', function() {
    let output;
    const consoleLog = console.log;
    const stdoutWrite = process.stdout.write;
    console.log(cwd);


    // ref https://github.com/mochajs/mocha/wiki/Mess-with-globals
    const cleanup = function() {
      console.log = consoleLog;
      process.stdout.write = stdoutWrite;
    };

    beforeEach(function() {
      output = '';
      process.stdout.write = console.log = (str) => output += str;
    });

    afterEach(cleanup);

    it('should be quiet', function(done) {
      const file = 'file.json';
      try {
        updateFile(file, newVersion, {quiet: true}, (err) => {
          assert.ifError(err);
          output.should.be.empty;
          done();
        });
      } catch (err) {
        assert.ifError(err);
      }
      cleanup();
    });


    it('should be loud', function(done) {
      const file = 'file.json';
      try {
        updateFile(file, newVersion, {}, (err) => {
          assert.ifError(err);
          output.should.not.be.empty;
          done();
        });
      } catch (err) {
        assert.ifError(err);
      }
      cleanup();
    });


    it('shows the file, current version and updated version', function(done) {
      const file = 'file.json';
      try {
        updateFile(file, newVersion, {}, (err, result) => {
          output.should.have.string(file);
          output.should.have.string(newVersion);
          output.should.have.string(result.oldVersion);
          done();
        });
      } catch (err) {
        assert.ifError(err);
      }
      cleanup();
    });
  });
});

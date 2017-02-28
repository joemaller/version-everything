/* eslint-env node,mocha */
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "should" }]*/

'use strict';

const should = require('chai').should();
const assert = require('chai').assert;

const fs = require('fs-extra');
const tmp = require('tmp');
const semver = require('semver');

tmp.setGracefulCleanup();

const updateFile = require('../app/update-file');




describe('Update a file', function() {
  let newVersion = '1.0.0';
  let tmpDir;
  const cwd = process.cwd();
  const fixtureDir = './test/fixture/deep/dotfile';

  beforeEach('refresh fixtures to tempfile', function() {
    newVersion = semver.inc(newVersion, 'patch');
    tmpDir = tmp.dirSync({unsafeCleanup: true}).name;
    fs.copySync(fixtureDir, tmpDir);
    process.chdir(tmpDir);
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
  it('should increment a plain text file (regex)');


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
      })
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
      })
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


  it('should increment a yaml file');
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


  it('should increment an xml file');
  it('should increment an xml plist file');


  it('should increment a json file without a file extension', function(done) {
    const file = 'naked-json';
    updateFile(file, newVersion, {quiet: true}, (err) => {
      assert.ifError(err);
      fs.readJson(file, (err, json) => {
        json.should.have.property('version', newVersion);
        done();
      })
    });
  });


  it('should increment an xml file without a file extension');
  it('should increment a yaml file without a file extension');


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
  it('passes version-less plain files through unchanged');


  describe('Test output (console.log)', function() {
    let output;
    const cwd = process.cwd();
    const consoleLog = console.log;
    const stdoutWrite = process.stdout.write;

    // ref https://github.com/mochajs/mocha/wiki/Mess-with-globals
    const cleanup = function() {
      process.chdir(cwd);
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

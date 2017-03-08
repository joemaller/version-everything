/* eslint no-console: false */
'use strict';

/**
 * Simple conditional wrapper for console.log
 * Honest question. Did I just curry console.log?
 * @param  {boolean} quiet  switch to enable logging
 * @return {function}       console.log or a noop
 */
module.exports = function(quiet) {
  return (quiet) ? ()=>{} : console.log;
};

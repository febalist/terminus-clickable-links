import * as fs from 'fs';
import {Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {ElectronService} from 'terminus-core';

import {LinkHandler} from './api';

const untildify = require('untildify');
const ipRegex = require('ip-regex');
const tlds = require('tlds');

const options = {exact: true, strict: false};
const protocol = `(?:(?:[a-z]+:)?//)${options.strict ? '' : '?'}`;
const auth = '(?:\\S+(?::\\S*)?@)?';
const ip = ipRegex.v4().source;
const host = '(?:(?:[a-z\\u00a1-\\uffff0-9][-_]*)*[a-z\\u00a1-\\uffff0-9]+)';
const domain = '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*';
const tld = `(?:\\.${options.strict ? '(?:[a-z\\u00a1-\\uffff]{2,})' : `(?:${tlds.sort((a, b) => b.length - a.length).join('|')})`})\\.?`;
const port = '(?::\\d{2,5})?';
const path = '(?:[/?#][^\\s"]*)?';

@Injectable()
export class URLHandler extends LinkHandler {
  // https://github.com/kevva/url-regex
  regex = new RegExp(`(?:${protocol}|www\\.)${auth}(?:localhost|${ip}|${host}${domain}${tld})${port}${path}`, 'i');

  priority = 7;

  constructor (
      private electron: ElectronService,
  ) {
    super();
  }

  handle (uri: string) {
    if (!uri.includes('://')) {
      uri = 'http://' + uri;
    }
    this.electron.shell.openExternal(uri);
  }
}

@Injectable()
export class UnixFileHandler extends LinkHandler {
  regex = /\B~?\/[\/\w.-]+(:\d+)?/;

  priority = 6;

  constructor (
      private electron: ElectronService,
  ) {
    super();
  }

  convert (uri: string): string {
    return untildify(uri);
  }

  handle (uri: string) {
    const [file, line] = uri.split(':');
    this.electron.shell.openExternal(`phpstorm://open?file=${file}&line=${line}`);
  }
}

@Injectable()
export class WindowsFileHandler extends LinkHandler {
  // Only absolute and home paths
  regex = /(([a-zA-Z]:|\\|~)\\[\w\-()\\\.]+|"([a-zA-Z]:|\\)\\[\w\s\-()\\\.]+")/;

  constructor (
      private toastr: ToastrService,
      private electron: ElectronService,
  ) {
    super();
  }

  convert (uri: string): string {
    const sanitizedUri = uri.replace(/"/g, '');
    return untildify(sanitizedUri);
  }

  handle (uri: string) {
    if (!fs.existsSync(uri)) {
      this.toastr.error('This windows path does not exist');
      return;
    }
    this.electron.shell.openExternal('file://' + uri);
  }
}

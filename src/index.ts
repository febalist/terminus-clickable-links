/*
    This plugin is based on Hyperterm Hyperlinks:
    https://github.com/zeit/hyperlinks/blob/master/index.js
*/

import { NgModule } from '@angular/core'
import { ToastrModule } from 'ngx-toastr'
import { TerminalDecorator } from 'terminus-terminal'

import { LinkHandler } from './api'
import { UnixFileHandler, WindowsFileHandler, URLHandler } from './handlers'
import { LinkHighlighterDecorator, HTermLinkHighlighterDecorator } from './decorator'

@NgModule({
    imports: [
        ToastrModule,
    ],
    providers: [
        { provide: LinkHandler, useClass: URLHandler, multi: true },
        { provide: LinkHandler, useClass: UnixFileHandler, multi: true },
        { provide: LinkHandler, useClass: WindowsFileHandler, multi: true },
        { provide: TerminalDecorator, useClass: LinkHighlighterDecorator, multi: true },
        { provide: TerminalDecorator, useClass: HTermLinkHighlighterDecorator, multi: true },
    ],
})
export default class LinkHighlighterModule { }

export * from './api'

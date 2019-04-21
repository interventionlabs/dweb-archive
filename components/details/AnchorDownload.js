import React from 'react';
import IAReactComponent from './IAReactComponent';
import AICUtil from "@internetarchive/dweb-archivecontroller/Util";
const debug = require('debug')('dweb-archive:AnchorDownload');

// Utility functions, I (Mitra) like to put these on Object, but maybe better here.
function ObjectFromEntries(arr) { arr.reduce((res,kv)=>(res[kv[0]]=kv[1],res),{});} // [[ k0, v0],[k1,v1] => {k0:v0, k1:v1}
function ObjectFilter(obj, f) { ObjectFromEntries( Object.entries(obj).filter(kv=>f(kv[0], kv[1]))); }

/* Clone of AnchorDetails with minor changes*/

export default class AnchorDownload extends IAReactComponent {

    constructor(props)
    {
        super(props); // identifier, format, source=ArchiveFile, children and a range of other props
        this.onClick = (ev) => { return this.clickCallable.call(this, ev); };
    }
    clickCallable(ev) {
        // Note this is only called in dweb; !Dweb has a director href
        debug("Cicking on link to download: %s",this.props.identifier);
        Nav.nav_download(this.props.source);
        ev.preventDefault();    // Prevent it going to the anchor (equivalent to "return false" in non-React
        // ev.stopPropagation(); ev.nativeEvent.stopImmediatePropagation(); // Suggested alternatives which dont work
        return false; // Stop the non-react version propogating
    }
    render() {
        // this.props passes identifier which is required for Dweb, but typically also passes tabIndex, class, title
        const url = new URL( ( this.props.filename
                ? `https://archive.org/download/${this.props.identifier}/{$this.props.filename}`
                : this.props.format
                ? `https://archive.org/compress/${this.props.identifier}/formats=${this.props.format}&file=/${this.props.identifier}.zip`
                : (typeof DwebArchive === "undefined")
                ? 'https://archive.org/download/${this.props.identifier'
                : 'https://dweb.archive.org/download/${this.props.identifier'));
        const usp = new URLSearchParams;
        AnchorDownload.urlparms.forEach(k=> usp.append(k, this.props[k]))
        usp.search = usp; // Note this copies, not updatable
        const anchorProps = ObjectFilter(this.props, (k,v)=>!AnchorDownload.urlparms.includes(k));
        return ( // Note there is intentionally no spacing in case JSX adds a unwanted line break
            (typeof DwebArchive === "undefined") ?
                <a href={url.href} {...anchorProps} target="_blank">{this.props.children}</a>
            :
                // This is the Dweb version for React|!React
                <a href={url.href} onClick={this.onClick}  {...anchorProps}>{this.props.children}</a>
            );
    }
}
AnchorDownload.urlparms=[]; // Properties that go in the URL to details
// Other props are passed to anchor, known inuse include: className, source, title, data-toggle data-placement data-container target

'use strict';


export default class SelectionParser {



    parse(request) {
        const rootTree = this.createBranch('root');

        if (request.hasHeader('select')) {
            request.getHeader('select').split(/\s*,\s*/gi).forEach((part) => {
                this.parseTree(rootTree, part.split('.'));
            });
        }

        return rootTree;
    }





    parseTree(tree, parts) {
        if (parts.length === 1) tree.properties.push(parts[0]);
        else if (parts.length > 1) {
            const name = parts[0];
            let currenRoot;

            if (tree.children.has(name)) {
                currenRoot = tree.children.get(name);
            } else {
                currenRoot = this.createBranch(tree);
                tree.children.set(parts[0], currenRoot);
            }
            
            this.parseTree(currenRoot, parts.slice(1));
        }
    }





    createBranch(name) {
        return {
            name: name,
            properties: [],
            children: new Map()
        }
    }
}
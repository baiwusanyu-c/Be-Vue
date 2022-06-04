import {baseCompile} from "./compiler-core/";
import * as runtimeDom from "./runtime-dom";
export * from "./runtime-dom";
export * from "./reactivity";
import {registryRuntimeCompiler} from "./runtime-dom";

function compileToFunction(template:string){
    const {code} = baseCompile(template)
    const render = new Function('vue',code)(runtimeDom)
    return render
}
registryRuntimeCompiler(compileToFunction)
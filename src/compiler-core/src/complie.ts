import {baseParse} from "./parse";
import {transform} from "./transform";
import {transformExpression} from "./transform/transformExpression";
import {transformElement} from "./transform/transformElement";
import {transformText} from "./transform/transformText";
import {generate} from "./codegen";

export function baseCompile(template:string){
    const ast = baseParse(template)
    transform(ast,{
        nodeTransforms:[transformExpression,transformElement,transformText]
    })
    return  generate(ast)
}
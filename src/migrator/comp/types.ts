import {PropsOptions} from "./vue-property-decorator/prop";
import {OptionalKind, ParameterDeclarationStructure} from "ts-morph";

export type AddProps = {
  atLeastOneDefaultValue: boolean,
  propsOptions: PropsOptions
}

export type AddWatch = {
  path: string;
  options: string | undefined;
  handlerMethod: string;
  parameters: OptionalKind<ParameterDeclarationStructure>[] | undefined;
  body: string;
  isAsync: boolean;
};

export type AddSpecialFunction =
  {
    name: string
    body: string | undefined
  };

export type AddFunction =
  {
    name: string
    parameters: OptionalKind<ParameterDeclarationStructure>[] | undefined;
    isAsync: boolean;
    returnType: string | undefined
    body: string | undefined
  }; 

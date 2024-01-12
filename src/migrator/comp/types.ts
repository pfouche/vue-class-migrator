import {PropsOptions} from "./vue-property-decorator/prop";
import {OptionalKind, ParameterDeclarationStructure} from "ts-morph";

export type AddProps = {
  atLeastOneDefaultValue: boolean,
  propsOptions: PropsOptions
}

export type AddWatch = CommentOptions & {
  path: string;
  options: string | undefined;
  handlerMethod: string;
  parameters: OptionalKind<ParameterDeclarationStructure>[] | undefined;
  body: string;
  isAsync: boolean;
};

export type AddSpecialFunction = CommentOptions &
  {
    name: string
    body: string | undefined
  };

export type AddFunction = CommentOptions &
  {
    name: string
    parameters: OptionalKind<ParameterDeclarationStructure>[] | undefined;
    isAsync: boolean;
    returnType: string | undefined
    body: string | undefined
  };

export const vuexDecorators = ['State', 'Getter', 'Mutation', 'Action'] as const
export const vuexComposables = ['useState', 'useGetters', 'useMutations', 'useActions'] as const

export type VuexDecorator = typeof vuexDecorators[number] 
export type VuexComposable = typeof vuexComposables[number] 

export type VuexEntities = {[id in VuexDecorator]: VuexComposable}

export const vuexEntities:VuexEntities = {
  State: 'useState',
  Getter: 'useGetters',
  Mutation: 'useMutations',
  Action: 'useActions',
}

export type AddVuexEntities = {
  namespace: string;
  entities:
    {
      name: string
      vuexName: string
    }[]
}

export type RoutingUsage = {
  useRoute: boolean
  useRouter: boolean
}


export type CommentOptions = {
  leadingComments: string | undefined;
  trailingComments: string | undefined;
}

export type ComputedGetSetOptions = {
  name: string;
  cache?: boolean;
  get: {
    statements?: string;
    returnType?: string;
  },
  set: {
    parameters: OptionalKind<ParameterDeclarationStructure>[] | undefined,
    statements?: string;
  }
};

export type ComputedBasicOptions = CommentOptions & {
  name: string;
  statements?: string;
  returnType?: string;
};

export type ComputedProps = ComputedGetSetOptions | ComputedBasicOptions;
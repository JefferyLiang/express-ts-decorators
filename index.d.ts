type ControllerLoaderOption = {
  filePath: string;
};

declare namespace expressTsDecorator {
  export function Controller(path: string): ClassDecorator;
  export function ControllerLoader(option: ControllerLoaderOption);
  export function Get(path: string): MethodDecorator;
  export function Put(path: string): MethodDecorator;
  export function Delete(path: string): MethodDecorator;
  export function Post(path: string): MethodDecorator;
}

export = expressTsDecorator;

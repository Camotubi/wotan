import {
    NodeFormatterLoader,
    Resolver,
    FormatterConstructor,
    NodeRuleLoader,
    RuleConstructor,
    FormatterLoaderHost,
    RuleLoaderHost,
    BuiltinResolver,
} from '@fimbul/wotan';
import { wrapTslintFormatter, wrapTslintRule } from '@fimbul/bifrost';
import * as TSLint from 'tslint';
import { injectable, ContainerModule } from 'inversify';

@injectable()
export class TslintFormatterLoaderHost extends NodeFormatterLoader {
    constructor(resolver: Resolver, builtinResolver: BuiltinResolver) {
        super(resolver, builtinResolver);
    }

    public loadCustomFormatter(name: string, basedir: string): FormatterConstructor | undefined {
        const result = super.loadCustomFormatter(name, basedir);
        if (result !== undefined)
            return result;
        const tslintFormatter = TSLint.findFormatter(name);
        return tslintFormatter && wrapTslintFormatter(tslintFormatter);
    }
}

@injectable()
export class TslintRuleLoaderHost extends NodeRuleLoader {
    constructor(resolver: BuiltinResolver) {
        super(resolver);
    }

    public loadCustomRule(name: string, dir: string): RuleConstructor | undefined {
        const rule = super.loadCustomRule(name, dir);
        if (rule !== undefined)
            return rule;
        const tslintRule = TSLint.findRule(name, dir);
        return tslintRule && wrapTslintRule(tslintRule, name);
    }
}

export function createModule() {
    return new ContainerModule((bind) => {
        bind(FormatterLoaderHost).to(TslintFormatterLoaderHost);
        bind(RuleLoaderHost).to(TslintRuleLoaderHost);
    });
}

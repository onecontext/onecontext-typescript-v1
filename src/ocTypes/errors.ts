import {z} from "zod";

export const customErrorMap: z.ZodErrorMap = (error, ctx) => {
    /*
    This is where you override the various error codes
    */
    switch (error.code) {
        case z.ZodIssueCode.custom:
            // produce a custom message using error.params
            // error.params won't be set unless you passed
            // a `params` arguments into a custom validator
            const params = error.params || {};
            if (params.myField) {
                return {message: `Bad input: ${params.myField}`};
            }
            break;
    }

    // fall back to default message!
    return {message: ctx.defaultError};
};

export const pipelineErrorMap: z.ZodErrorMap = (error, ctx) => {
    /*
    This is where you override the various error codes
    */
    switch (error.code) {
        case z.ZodIssueCode.invalid_enum_value:
            return {message: `You passed an invalid step name in your yaml file. You passed ${error.received}. The valid step names for this stage are ${"{"+error.options.join(", ")+"}"}`};
        case z.ZodIssueCode.invalid_union_discriminator:
            return {message: `You passed an invalid stage name in your yaml file. The valid stage names you can pass are: ${"{"+error.options.join(". ")+"}"}. For more, please see here: https://docs.onecontext.ai/pipelines/ .`};
        case z.ZodIssueCode.invalid_type:
            return {message: `You passed an invalid type, or left a field undefined (blank) in your yaml file. Remember, for each step, you must pass an object (dictionary) for the 'step_args' parameter, and, you must also pass an array (a list) for the 'depends_on' parameter. It is fine to pass empty objects, or arrays (if there are no dependencies, for example), but you must pass them so as to define them explicitly. It looks like this error is occurring at ${error.path.join(" -> ")}. For more, please see here: https://docs.onecontext.ai/pipelines/ .`};
    }

    // fall back to default message!
    return {message: ctx.defaultError};
};


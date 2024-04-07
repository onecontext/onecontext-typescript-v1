export function sleep({ms}: {ms:number}) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

export function flatKey({obj, key}: {obj: Record<string, any>, key: string}): any {
    if (!obj[key]) {
        return obj;
    }
    const flattenedObject = {...obj, ...obj[key]};
    if (!flattenedObject._split_overlap) {
        const {[key]: _, ...rest} = flattenedObject;
        return rest
    }
    else {
        const {[key]: _, _split_overlap, ...rest} = flattenedObject;
        return rest
    }
}
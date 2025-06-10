export const envVarToBoolean = (envVar: (typeof process.env)[string]) => String(envVar).toLowerCase() === 'true';

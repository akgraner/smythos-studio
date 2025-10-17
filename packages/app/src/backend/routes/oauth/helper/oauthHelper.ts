import { vault } from '@src/backend/services/SmythVault.class';
import { getTeamSettingsObj } from '@src/backend/services/team-data.service';

export const isKeyTemplateVariable = (str: string): boolean => {
  if (!str) return false;

  const pattern = /{{KEY\((.*?)\)}}/;

  const match = str.match(pattern);

  if (!match) return false;

  return true;
};

export const getKeyIdsFromTemplateVars = (str: string): string[] => {
  if (!str) return [];

  const pattern = /{{KEY\((.*?)\)}}/g;
  const keyIds = [];
  let match = [];

  while ((match = pattern.exec(str)) !== null) {
    if (match?.length < 2) continue;
    keyIds.push(match[1]);
  }

  return keyIds;
};

export const replaceTemplateVariablesOptimized = async (req) => {
  // Define template keys to check
  const keysToCheck = ['clientID', 'clientSecret', 'consumerKey', 'consumerSecret'];

  // Extract request body
  const reqBody = req.body;

  // Fetch template variables and their corresponding values
  const templateValues = await fetchTemplateValues(req, keysToCheck);

  // Map template variables to their fetched values
  const valuesObj = mapTemplateValues(templateValues, reqBody);

  // Store template keys in session
  req.session.templateKeys = Object.keys(valuesObj) || [];

  return reqBody;
};

// Function to fetch template values asynchronously
export const fetchTemplateValues = async (req, keysToCheck) => {
  /*
  This is supposed to search the keys in agent settings (legacy) and if not, search in the VAULT
  */
  const reqBody = req.body;
  const teamId = req._team?.id;
  // Fetch all team settings
  const allKeys = await getTeamSettingsObj(req, 'vault');
  const templateValues = [];

  for (const key of keysToCheck) {
    if (isKeyTemplateVariable(reqBody[key])) {
      const keyName = getKeyIdsFromTemplateVars(reqBody[key])[0];
      const filteredKeys = filter(allKeys, { team: teamId, keyName });
      // 1. search in agent settings
      let value = Object.values(filteredKeys).length ? Object.values(filteredKeys)[0] : null;

      // 2. search in vault
      if (!value) {
        value = (await vault.get({ team: teamId, keyName }, req)).key;
      }
      templateValues.push({ key, value });
    }
  }

  return templateValues;
};

// Function to map template variables to their fetched values
export const mapTemplateValues = (templateValues, reqBody) => {
  const valuesObj = {};

  templateValues.forEach(({ key, value }) => {
    if (value) {
      valuesObj[key] = value;
      reqBody[key] = typeof value === 'object' ? value['key'] : value;
    }
  });

  return valuesObj;
};

export const filter = (allKeys, { team, keyName }) => {
  const filteredKeys = {};

  for (const key in allKeys) {
    const keyObj = allKeys[key];

    if (keyObj.team === team && (!keyName || keyObj.name === keyName)) {
      filteredKeys[key] = keyObj;
    }
  }

  return filteredKeys;
};

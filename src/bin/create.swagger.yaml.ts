import * as fs from 'fs';
import * as yaml from 'js-yaml';
import path from 'path';

export default (swaggerSpec: object) => {
  if (swaggerSpec) {
    const yamlContent = yaml.dump(swaggerSpec);
    fs.writeFileSync(path.join(__dirname, '../../swagger.yaml'), yamlContent);  // Use path.join to resolve the path
    console.info('Swagger YAML file generated!');
  } else {
    console.error('Swagger specification is not available.');
  }
}


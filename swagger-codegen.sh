#! /bin/bash

java -jar swagger/bin/swagger-codegen-cli.jar \
    generate \
    -i swagger/swagger.yaml \
    -o src/app/generated \
    --lang typescript-angular \
    --template-dir swagger/templates

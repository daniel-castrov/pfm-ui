#! /bin/bash

java -jar swagger/bin/swagger-codegen-cli-2.2.3.jar \
    generate \
    -i swagger/swagger.yaml \
    -o src/app/generated \
    --lang typescript-angular2 \
    --template-dir swagger/templates

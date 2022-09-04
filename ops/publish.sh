
source .env
name="vrplayground"
commit="latest"
registry="$VRPLAYGROUND_REGISTRY"

echo "Building $registry/$name:$commit"
npm run build
npm run build-prod
echo "Tagging $name:$commit"
docker tag "$name:latest" "$name:$commit"
echo "Tagging $registry/$name:$commit"
docker tag "$name:$commit" "$registry/$name:$commit"
echo "Pushing $registry/$name:$commit"
docker push "$registry/$name:$commit"

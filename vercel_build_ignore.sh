if [[ "$VERCEL_GIT_COMMIT_REF" == "main" ]] ; then
  # Proceed with the build (exit code 1)
  exit 1;
else
  # Don't build (exit code 0)
  exit 0;
fi

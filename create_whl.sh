echo -e "# # # # # # # START : Creating Wheel file # # # # # # #"
pipenv install
pipenv run python ./setup.py bdist_wheel
echo -e "# # # # # # # END : Created Wheel file # # # # # # #"
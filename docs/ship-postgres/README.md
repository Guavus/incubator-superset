# Import Dashboards (Postgres Dump Method)

#### Current steps to import/ export dashboard:
1. Deploy superset with proper configs in deployment file (eg. raf-viz-fwk-deployment.yaml)
  1. Import the dashboards individually (Exported dashboards are in `*.json` format)
  1. Manually configure the publishers and subscribers

#### Known issues:
  * To ship superset as whole, no steps available. One needs to individually export and import dashboards.
  * Manual efforts to correctly configure publishers and subscribers for all charts (Risk of human errors)

---

Using postgres dump method, we can get fully configured superset as superset stores every metadata in the mentioned postgres table. It addresses the known issues which comes when one's deploying on a target machine.

#### Steps
1. Locate setup where superset is toring it's metadata. (eg. Using deployemnt file: raf-viz-fwk-deployment.yaml)
  2. Consider following vars in the deployment file:
```
- name: POSTGRES_DB
    value: rvf
- name: POSTGRES_HOST
    value: "x.x.x.x"
- name: POSTGRES_PORT
    value: "5432"
- name: POSTGRES_USER
    value: "postgres"
- name: POSTGRES_PASSWORD
    value: "postgres"
```
3. Connect to *POSTGRES_HOST* setup
##### Export:
4. Change directory
    ```
    cd /usr/pgsql-9.6/bin/
    ```
    Note: Don't use `pg_dump` directly as some setups gone through upgrade of 9.2 -> 9.6 might have some problem due to non - removal of older binaries.
5. Use *POSTGRES_DB* from the deployment file. Execute the following: 
    ```
    ./pg_dump -U postgres -h `hostname` -W -F p {POSTGRES_DB} > rvf_dump_backup.sql
    ```
    **Note**: Replace {POSTGRES_DB} with the value
6. If prompt for username/ password, refer deployment file. 
7. Copy the generated dump `rvf_dump_backup.sql` to the target machine where superset will store it's metadata.

##### Import:
8. On the target machine
    ```
    psql -U postgres -h `hostname`
    ```
9. Inside the psql shell:
    ```
    create database {POSTGRES_DB};
    \c {POSTGRES_DB};
    \i {PATH_TO_EXPORTED_DUMP}
    ```
    * {PATH_TO_EXPORTED_DUMP} = `/path/to/rvf_dump_backup.sql`
    * **Note**: Replace {POSTGRES_DB} and {PATH_TO_EXPORTED_DUMP} with the value
10. Now deploy using `raf-viz-fwk-deployment.yaml`

* **Note**: Make sure to change the datasource DB's address under `Sources` > `Databases` > `DB_Name` > `SQLAlchemy URI`
* **Open issue**: As we can't change the table name later on, try to have same table names for the datasource.

You have now successfully deployed Superset will all the dashboards and their configurations. 
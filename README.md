- hook errors into winston/hermod
- set new users to not be able to see anything other than profile until admin changes member type
- change signup email to say "you'll be added"
- email admins on new signup
- events

-- get db backup
rhc scp members --namespace hlpb download ./ app-root/data/DUMP/members.zip

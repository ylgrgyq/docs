def exec(cmd)
  puts cmd
  system cmd
end

task :check_ruby_version do |t|
  raise "Ruby < 1.9" if RUBY_VERSION.include? "1.8"
end

task :render => [:check_ruby_version] do |t|
  exec 'ruby render.rb'
end

task :deploy, [:type] => [] do |t, args|
  case args[:type]
  when "all"
    exec "fab -i ~/programming/avos/avos_dev.pem -H ubuntu@us.avoscloud.com deploy_docs"
	exec "fab -H ubuntu@p1.avoscloud.com,ubuntu@cn-stg1.avoscloud.com deploy_docs"
  when "us"
    exec "fab -i ~/.ssh/us-avoscloud.pem -H ubuntu@app1.us.avoscloud.com,ubuntu@app2.us.avoscloud.com deploy_docs:target=us"
  when "cn"
    exec "fab -H ubuntu@np1.avoscloud.com,ubuntu@np2.avoscloud.com,ubuntu@np3.avoscloud.com,ubuntu@np4.avoscloud.com deploy_docs"
  when "ucloud"
    exec "fab -H ubuntu@web1.avoscloud.com,ubuntu@web2.avoscloud.com,ubuntu@web3.avoscloud.com,ubuntu@web4.avoscloud.com,ubuntu@web5.avoscloud.com,ubuntu@web6.avoscloud.com deploy_docs"
  when "beta"
    exec "fab -H ubuntu@tsdb2.avoscloud.com deploy_docs"
  when "cn_stg"
    exec "fab -H ubuntu@cn-stg1.avoscloud.com deploy_docs"
  else
    exec "fab -H deploy@192.168.1.25 deploy_docs"
  end
end

task :install do |t|
  # exec "gem list | grep -E 'hpricot.*0\.8\.6' > /dev/null || sudo gem install hpricot"
  # exec "npm list -g | grep -E 'doctoc@0\.4\.4' > /dev/null || sudo npm install -g doctoc@0.4.4"
end

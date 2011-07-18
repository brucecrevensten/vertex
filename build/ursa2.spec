Name: ursa2

# pass this in the command line with --define "ursa2version 1.2.3"
Version: %{ursa2version}

# pass this in the command line with --define "buildnumber ###"
Release: %{ursa2buildnumber}
Summary: The URSA2 code base written using the Catalyst web framework.

Group: Web/Applications
License: BSD
Packager: ASF Engineering <engineering.group@asf.alaska.edu>
Distribution: ASF DAAC
Vendor: Alaska Satellite Facility
URL: http://www.asf.alaska.edu
Source0: ursa2.tgz
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-root-%(%{__id_u} -n)
BuildArch: noarch
BuildRequires: perl  
BuildRequires: perl(Test::WWW::Mechanize::Catalyst)
BuildRequires: perl(Test::More)
BuildRequires: perl(URI::Escape)
BuildRequires: perl(JavaScript::Minifier)
Requires: perl
Requires: perl(Apache2::Const)
Requires: perl(DBD::Oracle)
Requires: perl(DateTime)
Requires: perl(DateTime::Format::Strptime)
Requires: perl(DateTime::Format::DateParse)
Requires: perl(FCGI)
Requires: perl(Log::Log4perl)
Requires: perl(Catalyst::Runtime)
Requires: perl(Catalyst::Model::DBI)
Requires: perl(Catalyst::Model::Proxy)
Requires: perl(Catalyst::Action::RenderView)
Requires: perl(Catalyst::Plugin::Static::Simple)
Requires: perl(Catalyst::Plugin::ConfigLoader)
Requires: perl(Data::Dumper)
Requires: perl(Config::General)
Requires: perl(Exception::Class)
Requires: perl(Exception::Class::Base)
Requires: perl(XML::LibXML) <= 1.69
Requires: perl(XML::LibXSLT)
Requires: perl(JSON)
Requires: perl(Catalyst::View::TT)
Requires: perl(CGI::Session)
Requires: perl(CGI::Session::Driver::oracle)
Requires: perl(CGI::Cookie)
Requires: perl(Math::Polygon)
Requires: perl(URI::Escape)
Requires: mod_fcgid

%define inst_dir /usr/asf/eng/ursa2

%description
The URSA2 code base written using the Catalyst web framework.

%prep
echo Running %%prep!
%setup -c
/bin/chmod -Rf g+w .

# clean if last build was in error
rm -rf ${RPM_BUILD_ROOT}

%build
echo Nothing to %%build!

%install
echo Running %%install!
echo build root: ${RPM_BUILD_ROOT}

mkdir -p ${RPM_BUILD_ROOT}/%{inst_dir}
mkdir -p ${RPM_BUILD_ROOT}/%{inst_dir}/root

cp ursa2.conf.example ${RPM_BUILD_ROOT}/%{inst_dir}/ursa2.conf
mv Log4perl.conf.example Log4perl.conf

mkdir -p ${RPM_BUILD_ROOT}/etc/httpd/conf.d
mv etc/httpd/conf.d/api.daac.asf.alaska.edu.conf ${RPM_BUILD_ROOT}/etc/httpd/conf.d
mv etc/httpd/conf.d/dataportal.daac.asf.alaska.edu.conf ${RPM_BUILD_ROOT}/etc/httpd/conf.d
# Remove things that do not need to be included in the deployment.
rm -rf etc/
rm -rf misc/
rm -rf build/

# Minify javascript files.
script/minify_js.pl root/static/js


mkdir -p ${RPM_BUILD_ROOT}/etc/httpd/logs/api.daac.asf.alaska.edu
mkdir -p ${RPM_BUILD_ROOT}/etc/httpd/logs/dataportal.daac.asf.alaska.edu

perl Makefile.PL INSTALL_BASE=${RPM_BUILD_ROOT}%{inst_dir}
make test
make install

ln -s %{inst_dir}/ursa2.conf ${RPM_BUILD_ROOT}%{inst_dir}/lib/perl5/URSA2/ursa2.conf

%clean
rm -rf ${RPM_BUILD_ROOT}

%files
%dir %attr(0775,root,root) /etc/httpd/logs/api.daac.asf.alaska.edu
%dir %attr(0775,root,root) /etc/httpd/logs/dataportal.daac.asf.alaska.edu
%defattr(0644,root,root,2755)
%attr(0755,root,root) %{inst_dir}/bin/ursa2_fastcgi.pl
%config(noreplace) %attr(0644,root,root) %{inst_dir}/ursa2.conf
%config(noreplace) %attr(0644,root,root) /etc/httpd/conf.d/api.daac.asf.alaska.edu.conf
%config(noreplace) %attr(0644,root,root) /etc/httpd/conf.d/dataportal.daac.asf.alaska.edu.conf
%{inst_dir}/root
%{inst_dir}/lib
%{inst_dir}/man

%post
/etc/init.d/httpd reload

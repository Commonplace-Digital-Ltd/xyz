variable "app_name" {
  default = "map4"
}

# The variables below are defined on the HCP Cloud workspace

variable "aws_account" {
  nullable = false
}

variable "aws_region" {
  nullable = false
}

variable "environment" {
  nullable = false
}

variable "namespace" {
  nullable = false
}

variable "cluster_name" {
  nullable = false
}

variable "map_db" {
  nullable = false
}

# Not used in this project but useful for avoiding a warning
variable "dwh" {}
